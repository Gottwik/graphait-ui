import * as react_jsx_runtime from 'react/jsx-runtime';
import { GraphJSON } from '@gottwik/graphait';

interface GraphEditorEndpoints {
    graph: string;
    graphChat: string;
}
declare function GraphEditor({ endpoints: endpointOverrides }: {
    endpoints?: Partial<GraphEditorEndpoints>;
}): react_jsx_runtime.JSX.Element;

interface Props {
    graph: GraphJSON;
    onGraphChange: (g: GraphJSON) => void;
    endpoint?: string;
}
declare function GraphChat({ graph, onGraphChange, endpoint }: Props): react_jsx_runtime.JSX.Element;

declare function ContextEditor({ endpoint, defaultAsk, defaultRecommend, }: {
    endpoint?: string;
    defaultAsk?: string;
    defaultRecommend?: string;
}): react_jsx_runtime.JSX.Element;

export { ContextEditor, GraphChat, GraphEditor, type GraphEditorEndpoints };
