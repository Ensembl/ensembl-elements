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