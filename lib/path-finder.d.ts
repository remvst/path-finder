declare type Options<StateType> = {
    'hash': (state: StateType) => string;
    'neighbors': (state: StateType) => StateType[];
    'heuristic': (state: StateType, target: StateType) => number;
    'isTarget': (state: StateType, target: StateType) => boolean;
    'distance': (stateA: StateType, stateB: StateType) => number;
};
declare type Result<StateType> = {
    'found': boolean;
    'expandedOrder': StateType[];
    'steps': StateType[];
    'iterations': number;
};
export default class PathFinder<StateType> {
    private readonly hash;
    private readonly neighbors;
    private readonly heuristic;
    private readonly isTarget;
    private readonly distance;
    constructor(options: Options<StateType>);
    findPath(sources: StateType[], target: StateType, maxIterations?: number): Result<StateType>;
    private closestExpandable;
    private expand;
}
export {};
