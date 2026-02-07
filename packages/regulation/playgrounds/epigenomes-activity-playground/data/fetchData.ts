import { epigenomeIds } from './epigenomes';


const release = '2025-02';
const assemblyId = 'GCA_000001405.29';

const regionName = '8';

const url = `https://dev-2020.ensembl.org/api/regulation/epigenomes/v0.6/release/${release}/region_activity/assembly/${assemblyId}`;

export const fetchEpigenomeActivityData = ({start, end}: { start: number, end: number }) => {
  const body = {
    epigenome_ids: epigenomeIds,
    locations: [{ start, end }],
    region_name: regionName
  };

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(response => response.json());
};