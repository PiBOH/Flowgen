import { Handle, Position } from 'reactflow';
import { FlowNodeType } from '@/lib/types';

interface NodeProps {
  data: { label: string };
}

const baseClasses = 'px-4 py-2 rounded-lg border-2 shadow-sm text-sm font-medium text-center min-w-[120px]';

const nodeStyles: Record<FlowNodeType, string> = {
  start: 'bg-green-100 border-green-500 text-green-900 rounded-full',
  end: 'bg-red-100 border-red-500 text-red-900 rounded-full',
  declare: 'bg-cyan-100 border-cyan-500 text-cyan-900',
  input: 'bg-blue-100 border-blue-500 text-blue-900',
  output: 'bg-purple-100 border-purple-500 text-purple-900',
  assign: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  if: 'bg-orange-100 border-orange-500 text-orange-900 transform rotate-45',
  while: 'bg-indigo-100 border-indigo-500 text-indigo-900',
  for: 'bg-pink-100 border-pink-500 text-pink-900',
  comment: 'bg-gray-100 border-gray-400 text-gray-700 italic',
};

function NodeWrapper({ type, data }: { type: FlowNodeType; data: { label: string } }) {
  return (
    <div className={`${baseClasses} ${nodeStyles[type]}`}>
      {type === 'if' ? (
        <div className="transform -rotate-45">{data.label}</div>
      ) : (
        data.label
      )}
    </div>
  );
}

export function StartNode(props: NodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
      <NodeWrapper type="start" data={props.data} />
    </>
  );
}

export function EndNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-red-500" />
      <NodeWrapper type="end" data={props.data} />
    </>
  );
}

export function DeclareNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
      <NodeWrapper type="declare" data={props.data} />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
    </>
  );
}

export function InputNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <NodeWrapper type="input" data={props.data} />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </>
  );
}

export function OutputNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <NodeWrapper type="output" data={props.data} />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </>
  );
}

export function AssignNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
      <NodeWrapper type="assign" data={props.data} />
      <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
    </>
  );
}

export function IfNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      <NodeWrapper type="if" data={props.data} />
      <Handle type="source" position={Position.Bottom} id="true" className="!bg-orange-500" />
      <Handle type="source" position={Position.Right} id="false" className="!bg-orange-500" />
      <Handle type="target" position={Position.Bottom} id="merge" className="!bg-orange-500" />
    </>
  );
}

export function WhileNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <NodeWrapper type="while" data={props.data} />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
    </>
  );
}

export function ForNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-pink-500" />
      <NodeWrapper type="for" data={props.data} />
      <Handle type="source" position={Position.Bottom} className="!bg-pink-500" />
    </>
  );
}

export function CommentNode(props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <NodeWrapper type="comment" data={props.data} />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </>
  );
}
