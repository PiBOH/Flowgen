import { FlowchartModel } from './types';

export const exampleFlowchart: FlowchartModel = {
  nodes: [
    { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Start' } },
    { id: 'input', type: 'input', position: { x: 250, y: 100 }, data: { label: 'Input number', variable: 'number' } },
    { id: 'if', type: 'if', position: { x: 250, y: 200 }, data: { label: 'number % 2 == 0?', condition: 'number % 2 == 0' } },
    { id: 'output-even', type: 'output', position: { x: 100, y: 300 }, data: { label: 'Output Even', expression: '"Even"' } },
    { id: 'output-odd', type: 'output', position: { x: 400, y: 300 }, data: { label: 'Output Odd', expression: '"Odd"' } },
    { id: 'end', type: 'end', position: { x: 250, y: 400 }, data: { label: 'End' } },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'input' },
    { id: 'e2', source: 'input', target: 'if' },
    { id: 'e3', source: 'if', target: 'output-even', label: 'True' },
    { id: 'e4', source: 'if', target: 'output-odd', label: 'False' },
    { id: 'e5', source: 'output-even', target: 'end' },
    { id: 'e6', source: 'output-odd', target: 'end' },
  ],
};
