import PathFinder from '../src/path-finder';

type StateType = {
    'row': number,
    'col': number
};

describe('a path finder', () => {

    let maze: number[][];

    beforeEach(() => {
        maze = [
            [0, 0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 1, 0, 1, 0]
        ];
    });

    function newCell(
        row: number,
        col: number,
    ): StateType {
        return {'row': row, 'col': col};
    }

    function createPathFinder(): PathFinder<StateType> {
        return new PathFinder({
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
    }

    it('can find a path to itself', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0)],
            newCell(0, 0)
        );

        expect(result.found).toBe(true);
        expect(result.steps).toEqual([newCell(0, 0)]);
    });

    it('can find a path to itself with multiple sources', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0), newCell(2, 2)],
            newCell(0, 0)
        );

        expect(result.found).toBe(true);
        expect(result.steps).toEqual([newCell(0, 0)]);
    });

    it('can find a path one step away', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0)],
            newCell(0, 1)
        );

        expect(result.found).toBe(true);
        expect(result.steps).toEqual([newCell(0, 0), newCell(0, 1)]);
    });

    it('can find a path two steps away', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0)],
            newCell(1, 1)
        );

        expect(result.found).toBe(true);
        expect(result.steps).toEqual([newCell(0, 0), newCell(1, 0), newCell(1, 1)]);
    });

    it('can find an efficient path around the first wall', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0)],
            newCell(0, 5)
        );

        expect(result.found).toBe(true);
        expect(result.steps).toEqual([
            newCell(0, 0),
            newCell(0, 1),
            newCell(1, 1),
            newCell(2, 1),
            newCell(3, 1),
            newCell(4, 1),
            newCell(4, 2),
            newCell(4, 3),
            newCell(3, 3),
            newCell(2, 3),
            newCell(1, 3),
            newCell(0, 3),
            newCell(0, 4),
            newCell(0, 5)
        ]);
    });

    it('can find an efficient path around the second wall', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0)],
            newCell(4, 5)
        );

        expect(result.found).toBe(true);
        expect(result.steps).toEqual([
            newCell(0, 0),
            newCell(1, 0),
            newCell(2, 0),
            newCell(3, 0),
            newCell(4, 0),
            newCell(4, 1),
            newCell(4, 2),
            newCell(4, 3),
            newCell(3, 3),
            newCell(2, 3),
            newCell(1, 3),
            newCell(0, 3),
            newCell(0, 4),
            newCell(0, 5),
            newCell(1, 5),
            newCell(2, 5),
            newCell(3, 5),
            newCell(4, 5)
        ]);
    });

    it('can find an efficient path around the second wall with two sources', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0), newCell(4, 2)],
            newCell(4, 5)
        );

        expect(result.found).toBe(true);
        expect(result.steps).toEqual([
            newCell(4, 2),
            newCell(4, 3),
            newCell(3, 3),
            newCell(2, 3),
            newCell(1, 3),
            newCell(0, 3),
            newCell(0, 4),
            newCell(0, 5),
            newCell(1, 5),
            newCell(2, 5),
            newCell(3, 5),
            newCell(4, 5)
        ]);
    });

    it('can detect that a path is not reachable', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0)],
            newCell(7, 0)
        );

        expect(result.found).toBe(false);
        expect(result.steps).toEqual([]);
        expect(result.iterations).toBe(22);
    });

    it('can fail to find a path if the max number of iterations is too low', () => {
        const pf = createPathFinder();

        const result = pf.findPath(
            [newCell(0, 0)],
            newCell(4, 5),
            5
        );

        expect(result.found).toBe(false);
        expect(result.steps).toEqual([]);
        expect(result.iterations).toBe(5);
    });

});
