import path from 'node:path';
import { Hono } from 'hono';
import { DatabaseSync } from 'node:sqlite';

import { parseViewportString } from './helpers.ts';

import type { Alignment } from '../../alignments/types/alignment.ts';

const alignments = new Hono();

const dbPath = path.resolve(import.meta.dirname, '../data/db.sqlite');

alignments.get('/', (c) => {
  const viewportString = c.req.query('viewport');
  const queryMode = c.req.query('mode');

  if (!viewportString) {
    throw 'Missing query';
  }

  const { regionName, start, end } = parseViewportString(viewportString);

  const alignments = queryMode === 'alternate'
    ? readAlignmentsFromAltSequence({ regionName, start, end })
    : readAlignments({ regionName, start, end })

  return c.json(alignments);
});

const readAlignments = ({
  regionName,
  start,
  end
}: {
  regionName: string;
  start: number;
  end: number;
}) => {
  const db = new DatabaseSync(dbPath);

  const statement = db.prepare(`
    SELECT * from alignments
    WHERE reference_region_name = :regionName
    AND
      (
        ( reference_start > :start
          AND reference_start < :end
        )
        OR
        ( reference_start + reference_length > :start
          AND reference_start < :end
        )
      )`
  );
  const storedData = statement.all({
    regionName,
    start,
    end
  });

  db.close();

  return storedData.map(item => {
    const referenceStart = item.reference_strand === '+'
      ? item.reference_start
      : (item.reference_sequence_length as number) - (item.reference_start as number);
    const targetStart = item.target_strand === '+'
      ? item.target_start
      : (item.target_sequence_length as number) - (item.target_start as number);

    const alignmentWithoutId = {
      reference: {
        region_name: item.reference_region_name,
        start: referenceStart,
        length: item.reference_length,
        strand: item.reference_strand === '+' ? 'forward' : 'reverse'
      },
      target: {
        region_name: item.target_region_name,
        start: targetStart,
        length: item.target_length,
        strand: item.target_strand === '+' ? 'forward' : 'reverse'
      }
    } as Omit<Alignment, 'id'>;
    return generateAlignmentWithId(alignmentWithoutId);
  });
}


const readAlignmentsFromAltSequence = ({
  regionName,
  start,
  end
}: {
  regionName: string;
  start: number;
  end: number;
}) => {
  const db = new DatabaseSync(dbPath);

  const statement = db.prepare(`
    SELECT * from alignments
    WHERE target_region_name = :regionName
    AND
      ( target_start + target_length > :start
        AND target_start < :end
      )`
  );
  const storedData = statement.all({
    regionName: `chr${regionName}`,
    start,
    end
  });

  return storedData.map(item => {
    const alignmentWithoutId = {
      reference: {
        region_name: item.reference_region_name,
        start: item.reference_start,
        length: item.reference_length,
        strand: item.reference_strand === '+' ? 'forward' : 'reverse'
      },
      target: {
        region_name: item.target_region_name,
        start: item.target_start,
        length: item.target_length,
        strand: item.target_strand === '+' ? 'forward' : 'reverse'
      }
    } as Omit<Alignment, 'id'>;
    return generateAlignmentWithId(alignmentWithoutId);
  });
}

const generateAlignmentWithId = (alignment: Omit<Alignment, 'id'>) => {
  const id = `${
    alignment.reference.region_name
  }-${
    alignment.reference.start
  }-${
    alignment.reference.length
  }-${
    alignment.target.start
  }-${
    alignment.target.length
  }`

  return {
    ...alignment,
    id
  };
}


export default alignments;