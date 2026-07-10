import { FlowchartModel, FlowNode, FlowEdge } from '@/lib/types';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildAdjacency(nodes: FlowNode[], edges: FlowEdge[]) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, FlowEdge[]>();
  const incoming = new Map<string, FlowEdge[]>();

  for (const edge of edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    outgoing.get(edge.source)!.push(edge);
    incoming.get(edge.target)!.push(edge);
  }

  return { nodeMap, outgoing, incoming };
}

function findMergeNode(
  outgoing: Map<string, FlowEdge[]>,
  trueBranchStart: string,
  falseBranchStart: string,
  visitedTrue: Set<string> = new Set(),
  visitedFalse: Set<string> = new Set()
): string | null {
  const queueTrue = [trueBranchStart];
  const queueFalse = [falseBranchStart];

  while (queueTrue.length || queueFalse.length) {
    const nextTrue = queueTrue.shift();
    if (nextTrue) {
      visitedTrue.add(nextTrue);
      if (visitedFalse.has(nextTrue)) return nextTrue;
      for (const edge of outgoing.get(nextTrue) || []) {
        if (!visitedTrue.has(edge.target)) queueTrue.push(edge.target);
      }
    }

    const nextFalse = queueFalse.shift();
    if (nextFalse) {
      visitedFalse.add(nextFalse);
      if (visitedTrue.has(nextFalse)) return nextFalse;
      for (const edge of outgoing.get(nextFalse) || []) {
        if (!visitedFalse.has(edge.target)) queueFalse.push(edge.target);
      }
    }
  }

  return null;
}

function nodeToXml(node: FlowNode, indent: number): string {
  const pad = '  '.repeat(indent);

  switch (node.type) {
    case 'start':
    case 'end':
      return `${pad}<comment text="${escapeXml(node.data.label || node.type)}"/>`;
    case 'declare':
      return `${pad}<declare name="${escapeXml(node.data.variable || '')}" type="${escapeXml(
        node.data.varType || 'Integer'
      )}" array="False" size=""/>`;
    case 'input':
      return `${pad}<input variable="${escapeXml(node.data.variable || node.data.label || '')}"/>`;
    case 'output':
      return `${pad}<output expression="${escapeXml(node.data.expression || node.data.label || '')}" newline="True"/>`;
    case 'assign':
      return `${pad}<assign variable="${escapeXml(node.data.variable || '')}" expression="${escapeXml(
        node.data.expression || ''
      )}"/>`;
    case 'if':
    case 'while':
    case 'for':
      return `${pad}<comment text="${escapeXml(node.data.label || node.type)}"/>`;
    case 'comment':
      return `${pad}<comment text="${escapeXml(node.data.label || '')}"/>`;
    default:
      return `${pad}<comment text="${escapeXml(node.data.label || '')}"/>`;
  }
}

function generateSequence(
  startId: string,
  endId: string | null,
  ctx: ReturnType<typeof buildAdjacency>,
  visited: Set<string>,
  indent: number
): string[] {
  const result: string[] = [];
  let currentId: string | null = startId;

  while (currentId && currentId !== endId) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const node = ctx.nodeMap.get(currentId);
    if (!node) break;

    if (node.type === 'if') {
      const outEdges = ctx.outgoing.get(currentId) || [];
      const trueEdge = outEdges.find((e) => e.label?.toLowerCase() === 'true');
      const falseEdge = outEdges.find((e) => e.label?.toLowerCase() === 'false');

      if (trueEdge && falseEdge) {
        const mergeNode = findMergeNode(ctx.outgoing, trueEdge.target, falseEdge.target);
        const pad = '  '.repeat(indent);
        result.push(`${pad}<if expression="${escapeXml(node.data.condition || node.data.label || '')}">`);
        result.push(`${pad}  <then>`);
        result.push(...generateSequence(trueEdge.target, mergeNode, ctx, visited, indent + 2));
        result.push(`${pad}  </then>`);
        result.push(`${pad}  <else>`);
        result.push(...generateSequence(falseEdge.target, mergeNode, ctx, visited, indent + 2));
        result.push(`${pad}  </else>`);
        result.push(`${pad}</if>`);
        currentId = mergeNode;
        continue;
      }
    }

    if (node.type === 'while') {
      const outEdges = ctx.outgoing.get(currentId) || [];
      const bodyEdge = outEdges.find((e) => e.label?.toLowerCase() !== 'loop');
      const loopBackEdge = outEdges.find((e) => e.label?.toLowerCase() === 'loop');
      const bodyEnd = loopBackEdge ? loopBackEdge.target : null;
      const afterLoop = bodyEnd ? (ctx.outgoing.get(bodyEnd) || []).find((e) => e.target !== currentId)?.target || null : null;

      const pad = '  '.repeat(indent);
      result.push(`${pad}<while expression="${escapeXml(node.data.condition || node.data.label || '')}">`);
      if (bodyEdge) {
        result.push(...generateSequence(bodyEdge.target, bodyEnd, ctx, visited, indent + 1));
      }
      result.push(`${pad}</while>`);
      currentId = afterLoop;
      continue;
    }

    if (node.type === 'for') {
      const outEdges = ctx.outgoing.get(currentId) || [];
      const bodyEdge = outEdges.find((e) => e.label?.toLowerCase() !== 'loop');
      const loopBackEdge = outEdges.find((e) => e.label?.toLowerCase() === 'loop');
      const bodyEnd = loopBackEdge ? loopBackEdge.target : null;
      const afterLoop = bodyEnd ? (ctx.outgoing.get(bodyEnd) || []).find((e) => e.target !== currentId)?.target || null : null;

      const pad = '  '.repeat(indent);
      result.push(
        `${pad}<for variable="${escapeXml(node.data.variable || '')}" start="${escapeXml(
          node.data.start || ''
        )}" end="${escapeXml(node.data.end || '')}" direction="${node.data.direction || 'inc'}" step="${escapeXml(
          node.data.step || '1'
        )}">`
      );
      if (bodyEdge) {
        result.push(...generateSequence(bodyEdge.target, bodyEnd, ctx, visited, indent + 1));
      }
      result.push(`${pad}</for>`);
      currentId = afterLoop;
      continue;
    }

    result.push(nodeToXml(node, indent));

    const outEdges = ctx.outgoing.get(currentId) || [];
    currentId = outEdges[0]?.target || null;
  }

  return result;
}

export function exportToFprg(flowchart: FlowchartModel, filename = 'diagram.fprg') {
  const ctx = buildAdjacency(flowchart.nodes, flowchart.edges);
  const startNode = flowchart.nodes.find((n) => n.type === 'start');
  const visited = new Set<string>();

  let body: string[] = [];
  if (startNode) {
    try {
      body = generateSequence(startNode.id, null, ctx, visited, 6);
    } catch {
      // Fallback to a flat sequence if nested generation fails
      body = flowchart.nodes.map((node) => nodeToXml(node, 6));
    }
  } else {
    body = flowchart.nodes.map((node) => nodeToXml(node, 6));
  }

  const xml = `<?xml version="1.0"?>
<flowgorithm fileversion="2.11">
  <attributes>
    <attribute name="name" value="Flowgen Export"/>
    <attribute name="authors" value="Flowgen User"/>
  </attributes>
  <function name="Main" type="None" variable="">
    <parameters/>
    <body>
${body.join('\n')}
    </body>
  </function>
</flowgorithm>`;

  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
