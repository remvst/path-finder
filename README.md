# Path Finder

Generic path finder implementation.
Can be used for paths but also for more general problems.

The best possible path is not guaranteed, but the path finder will try its best to find a path as quickly as possible.

## Usage

### Generic Problem Solving
```javascript
const PathFinder = require('@remvst/path-finder');

// Prepare the path finder
const pf = new PathFinder({
    'hash': state => someUniqueString(state)
    'neighbors': state => neighborsOf(state),
    'heuristic': (state, target) => naiveDistanceBetween(state, target),
    'isTarget': (position, target) => equals(position, target),
    'distance': (positionA, positionB) => actualDistanceBetween(positionA, positionB)
});

// Find a path
const result = pf.findPath(
    [possibleSource1, possibleSource2],
    myTarget
);

if (result.found) {
    console.log(result.steps); // path.steps is the list of states to reach the target
}
```

### Maze
```javascript
const maze = [
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 1, 0]
];

function newCell(row, col) {
    return {'row': row, 'col': col};
}

const pf = new PathFinder({
    'hash': position => position.row + '-' + position.col,
    'neighbors': position => {
        return [
            newCell(position.row + 1, position.col),
            newCell(position.row, position.col - 1),
            newCell(position.row, position.col + 1),
            newCell(position.row - 1, position.col)
        ].filter(position => {
            return position.row >= 0 && position.col >= 0 && position.row < maze.length && position.col < maze[0].length;
        }).filter(position => {
            return maze[position.row][position.col] === 0;
        });
    },
    'heuristic': (position, target) => {
        return Math.abs(position.row - target.row) + Math.abs(position.col - target.col);
    },
    'isTarget': (position, target) => {
        return position.row === target.row && position.col === target.col;
    },
    'distance': (positionA, positionB) => {
        return Math.abs(positionA.row - positionB.row) + Math.abs(positionA.col - positionB.col);
    }
});

const result = pf.findPath(
    [newCell(0, 0)],
    newCell(4, 5)
);

if (result.found) {
    console.log(result.steps); // path.steps is the list of states to reach the target
}
```
