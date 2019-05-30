'use strict';

class PathNodeSet {

    constructor() {
        this.map = {};
        this.list = [];
    }

    add(key, node) {
        if (this.has(key)) {
            return;
        }

        this.list.push(node);
        this.map[key] = node;
    }

    fetch(key) {
        return this.map[key] || null;
    }

    has(key) {
        return !!this.fetch(key);
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

        delete this.map[key];
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
        this.funcs = {};
        this.funcs.hash = options.hash;
        this.funcs.neighbors = options.neighbors;
        this.funcs.heuristic = options.heuristic;
        this.funcs.isTarget = options.isTarget;
        this.funcs.distance = options.distance;
    }

    hashFor(node) {
        return this.funcs.hash(node);
    }

    neighborsFor(node) {
        return this.funcs.neighbors(node);
    }

    heuristicFor(node, target) {
        return this.funcs.heuristic(node, target);
    }

    isTarget(node, target) {
        return this.funcs.isTarget(node, target);
    }

    distanceBetween(nodeA, nodeB) {
        return this.funcs.distance(nodeA, nodeB);
    }

    findPath(sources, target, maxIterations = 100) {
        const expandable = new PathNodeSet();
        const expanded = new PathNodeSet();

        // Add the initial node
        sources.forEach(source => {
            expandable.add(this.hashFor(source), new PathNode(source));
        });

        let finalPathNode;

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

    closestExpandable(expandableSet, target) {
        let closest = null;
        let closestHeuristic;

        expandableSet.list.forEach(pathElement => {
            const heuristic = this.heuristicFor(pathElement.node, target) + pathElement.distance;
            if (!closest || heuristic < closestHeuristic) {
                closest = pathElement;
                closestHeuristic = heuristic;
            }
        });

        return closest;
    }

    expand(pathElement, expandableSet, expandedSet) {
        // Mask as expanded
        const nodeHash = this.hashFor(pathElement.node);

        expandedSet.add(nodeHash, pathElement);
        expandableSet.remove(nodeHash);

        // Actually expand
        const neighbors = this.neighborsFor(pathElement.node);
        neighbors.forEach(neighborNode => {
            const neighborHash = this.hashFor(neighborNode);
            const neighborDistance = pathElement.distance + this.distanceBetween(pathElement.node, neighborNode);

            const alreadyExpanded = expandedSet.fetch(neighborHash);
            if (alreadyExpanded) {
                return;
            }

            expandableSet.add(neighborHash, new PathNode(neighborNode, pathElement, neighborDistance));
        });
    }

}

module.exports = PathFinder;
