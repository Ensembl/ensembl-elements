import '@ensembl/ensembl-elements-common/components/table/sortable-column-header.js';

import '@ensembl/ensembl-elements-common/styles/custom-properties.css';
import '@ensembl/ensembl-elements-common/styles/resets.css';
import '@ensembl/ensembl-elements-common/styles/global.css';
import '@ensembl/ensembl-elements-common/styles/table.css';

export default {
  title: 'Common/Table'
};

const tableString = `
<table class="ens-table">
  <thead>
    <tr>
      <th>
        One
      </th>
      <th>
        Two
      </th>
      <th>
        Three
      </th>
      <th>
        Four
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        First row one
      </td>
      <td>
        First row two
      </td>
      <td>
        First row three
      </td>
      <td>
        First row four
      </td>
    </tr>
  </tbody>
</table>
`

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = tableString;
  element.innerHTML = innerHtml;
  return element;
};

const tableWithSortableColumnsString = `
<table class="ens-table">
  <thead>
    <tr>
      <th>
        <ens-table-sortable-column-head>
          One
        </ens-table-sortable-column-head>
      </th>
      <th>
        Two
      </th>
      <th>
        Three
      </th>
      <th>
        Four
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        First row one
      </td>
      <td>
        First row two
      </td>
      <td>
        First row three
      </td>
      <td>
        First row four
      </td>
    </tr>
  </tbody>
</table>
`

export const WithSortableColumns = () => {
  const element = document.createElement('div');
  const innerHtml = tableWithSortableColumnsString;
  element.innerHTML = innerHtml;

  const sortableColumnHead = element.querySelector('ens-table-sortable-column-head');
  sortableColumnHead.addEventListener('click', (event) => {
    const element = event.target as HTMLElement;
    const sortingOrder = element.getAttribute('sort-order');
    let nextSortingOrder: string | undefined;

    if (!sortingOrder) {
      nextSortingOrder = 'asc';
    } else if (sortingOrder === 'asc') {
      nextSortingOrder = 'desc';
    }

    if (nextSortingOrder) {
      element.setAttribute('sort-order', nextSortingOrder);
    } else {
      element.removeAttribute('sort-order');
    }
  });
  return element;
};