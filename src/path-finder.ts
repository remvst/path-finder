'use strict';

class PathNodeSet<StateType> {

    private readonly map: Map<string, PathNode<StateType>> = new Map();
    readonly list: PathNode<StateType>[] = [];

    add(key: string, node: PathNode<StateType>) {
        if (this.has(key)) {
            return;
        }

        this.list.push(node);
        this.map.set(key, node);
    }

    fetch(key: string): PathNode<StateType> | null {
        return this.map.get(key) || null;
    }

    has(key: string): boolean {
        return this.map.has(key);
    }

    remove(key: string) {
        const node = this.fetch(key);
        if (!node) {
            return;
        }

        const index = this.list.indexOf(node);
        if (index >= 0) {
            this.list.splice(index, 1);
        }

        this.map.delete(key);
    }

}

class PathNode<StateType> {

    readonly node: StateType;
    readonly parent: PathNode<StateType> | null;
    readonly distance: number;

    constructor(
        node: StateType,
        parent: PathNode<StateType> | null = null,
        distance: number = 0,
    ) {
        this.node = node;
        this.parent = parent;
        this.distance = distance;
    }

}

type Options<StateType> = {
    'hash': (state: StateType) => string;
    'neighbors': (state: StateType) => StateType[];
    'heuristic': (state: StateType, target: StateType) => number;
    'isTarget': (state: StateType, target: StateType) => boolean;
    'distance': (stateA: StateType, stateB: StateType) => number;
};

type Result<StateType> = {
    'found': boolean;
    'expandedOrder': StateType[];
    'steps': StateType[];
    'iterations': number;
}

export default class PathFinder<StateType> {

    private readonly hash: (state: StateType) => string;
    private readonly neighbors: (state: StateType) => StateType[];
    private readonly heuristic: (state: StateType, target: StateType) => number;
    private readonly isTarget: (state: StateType, target: StateType) => boolean;
    private readonly distance: (stateA: StateType, stateB: StateType) => number;

    constructor(options: Options<StateType>) {
        this.hash = options.hash;
        this.neighbors = options.neighbors;
        this.heuristic = options.heuristic;
        this.isTarget = options.isTarget;
        this.distance = options.distance;
    }

    findPath(
        sources: StateType[],
        target: StateType,
        maxIterations: number = 100,
    ): Result<StateType> {
        const expandable = new PathNodeSet<StateType>();
        const expanded = new PathNodeSet<StateType>();

        // Add the initial node
        sources.forEach(source => {
            expandable.add(
                this.hash(source),
                new PathNode(source),
            );
        });

        let finalPathNode: PathNode<StateType> | null = null;

        const expandedOrder = [];

        let iteration;
        for (iteration = 0 ; iteration < maxIterations ; iteration++) {
            const pathElement = this.closestExpandable(expandable, target);
            if (!pathElement) {
                break;
            }

            if (this.isTarget(pathElement.node, target)) {
                finalPathNode = pathElement;
                break;
            }

            this.expand(pathElement, expandable, expanded);
            expandedOrder.push(pathElement.node);
        }

        const steps = [];
        let pathNode = finalPathNode;
        while (pathNode && finalPathNode) {
            steps.unshift(pathNode.node);
            pathNode = pathNode.parent;
        }

        return {
            'found': !!finalPathNode,
            'expandedOrder': expandedOrder,
            'steps': steps,
            'iterations': iteration
        };
    }

    private closestExpandable(
        expandableSet: PathNodeSet<StateType>,
        target: StateType,
    ): PathNode<StateType> | null {
        let closest: PathNode<StateType> | null = null;
        let closestHeuristic = Number.MAX_SAFE_INTEGER;

        expandableSet.list.forEach(pathElement => {
            const heuristic = this.heuristic(pathElement.node, target) + pathElement.distance;
            if (!closest || heuristic < closestHeuristic) {
                closest = pathElement;
                closestHeuristic = heuristic;
            }
        });

        return closest;
    }

    private expand(
        pathElement: PathNode<StateType>,
        expandableSet: PathNodeSet<StateType>,
        expandedSet: PathNodeSet<StateType>,
    ) {
        // Mask as expanded
        const nodeHash = this.hash(pathElement.node);

        expandedSet.add(nodeHash, pathElement);
        expandableSet.remove(nodeHash);

        // Actually expand
        for (const neighborNode of this.neighbors(pathElement.node)) {
            const neighborHash = this.hash(neighborNode);
            const neighborDistance = pathElement.distance + this.distance(pathElement.node, neighborNode);

            const alreadyExpanded = expandedSet.fetch(neighborHash);
            if (!alreadyExpanded) {
                expandableSet.add(neighborHash, new PathNode(neighborNode, pathElement, neighborDistance));
            }
        }
    }
}
