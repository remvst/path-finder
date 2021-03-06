'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class PathNodeSet {
    constructor() {
        this.map = new Map();
        this.list = [];
    }
    add(key, node) {
        if (this.has(key)) {
            return;
        }
        this.list.push(node);
        this.map.set(key, node);
    }
    fetch(key) {
        return this.map.get(key) || null;
    }
    has(key) {
        return this.map.has(key);
    }
    remove(key) {
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
class PathNode {
    constructor(node, parent = null, distance = 0) {
        this.node = node;
        this.parent = parent;
        this.distance = distance;
    }
}
class PathFinder {
    constructor(options) {
        this.hash = options.hash;
        this.neighbors = options.neighbors;
        this.heuristic = options.heuristic;
        this.isTarget = options.isTarget;
        this.distance = options.distance;
    }
    findPath(sources, target, maxIterations = 100) {
        const expandable = new PathNodeSet();
        const expanded = new PathNodeSet();
        // Add the initial node
        sources.forEach(source => {
            expandable.add(this.hash(source), new PathNode(source));
        });
        let finalPathNode = null;
        const expandedOrder = [];
        let iteration;
        for (iteration = 0; iteration < maxIterations; iteration++) {
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
    closestExpandable(expandableSet, target) {
        let closest = null;
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
    expand(pathElement, expandableSet, expandedSet) {
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
exports.default = PathFinder;
