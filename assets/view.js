document.addEventListener('DOMContentLoaded', function () {
  const blocks = document.querySelectorAll('.pota-dashboard-block');

  blocks.forEach(function (container) {
    const callsigns = JSON.parse(container.dataset.callsigns || '[]');
    const cacheDurationHours = parseInt(container.dataset.cacheDuration || '12', 10);
    const CACHE_KEY = 'pota_stats_data_' + callsigns.sort().join('_');
    let tableData = [];
    let sortDirection = {};

    async function fetchCallsignStats(call) {
      try {
        const response = await fetch('https://api.pota.app/stats/user/' + call);
        if (!response.ok) throw new Error('HTTP ' + response.status);

        const data = await response.json();
        const actStats = data.activator || {};
        const huntStats = data.hunter || {};

        return {
          callsign: (data.callsign || call).toUpperCase(),
          activations: Number(actStats.activations) || 0,
          activatedParks: Number(actStats.parks) || 0,
          huntedParks: Number(huntStats.parks) || 0,
          qsos: (Number(actStats.qsos) || 0) + (Number(huntStats.qsos) || 0),
          awards: Number(data.awards) || 0,
        };
      } catch (err) {
        return {
          callsign: call.toUpperCase(),
          activations: 0,
          activatedParks: 0,
          huntedParks: 0,
          qsos: 0,
          awards: 0,
        };
      }
    }

    async function loadData() {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const ageInHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
          if (ageInHours < cacheDurationHours) {
            return parsed.data;
          }
        } catch (e) {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      const freshData = await Promise.all(callsigns.map(fetchCallsignStats));
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: freshData })
      );
      return freshData;
    }

    function calculateTotals(data) {
      return data.reduce(
        function (acc, row) {
          acc.activations += row.activations;
          acc.activatedParks += row.activatedParks;
          acc.huntedParks += row.huntedParks;
          acc.qsos += row.qsos;
          acc.awards += row.awards;
          return acc;
        },
        { activations: 0, activatedParks: 0, huntedParks: 0, qsos: 0, awards: 0 }
      );
    }

    function updateTableBody(data, tbody, tfoot) {
      // 1. Render Body Rows
      tbody.innerHTML = data
        .map(function (row) {
          return (
            '<tr>' +
              '<td>' +
                '<a href="https://pota-stats.wd4dan.net/?call=' + encodeURIComponent(row.callsign) + '" target="_blank" rel="noopener noreferrer" class="pota-call-link">' +
                  '<span class="pota-badge-callsign">' + row.callsign + '</span>' +
                '</a>' +
              '</td>' +
              '<td><span class="pota-badge pota-badge-act">' + row.activations.toLocaleString() + '</span></td>' +
              '<td>' + row.activatedParks.toLocaleString() + '</td>' +
              '<td><span class="pota-badge pota-badge-hunt">' + row.huntedParks.toLocaleString() + '</span></td>' +
              '<td>' + row.qsos.toLocaleString() + '</td>' +
              '<td>' + row.awards.toLocaleString() + '</td>' +
            '</tr>'
          );
        })
        .join('');

      // 2. Render Total Row
      const totals = calculateTotals(data);
      tfoot.innerHTML = (
        '<tr class="pota-total-row">' +
          '<td><strong>Total (' + data.length + ')</strong></td>' +
          '<td><strong>' + totals.activations.toLocaleString() + '</strong></td>' +
          '<td><strong>' + totals.activatedParks.toLocaleString() + '</strong></td>' +
          '<td><strong>' + totals.huntedParks.toLocaleString() + '</strong></td>' +
          '<td><strong>' + totals.qsos.toLocaleString() + '</strong></td>' +
          '<td><strong>' + totals.awards.toLocaleString() + '</strong></td>' +
        '</tr>'
      );
    }

    function sortTable(col, headerElement, tbody, tfoot) {
      const isAsc = sortDirection[col] !== 'asc';
      sortDirection[col] = isAsc ? 'asc' : 'desc';

      container.querySelectorAll('.pota-table th').forEach(function (th) {
        th.classList.remove('asc', 'desc');
      });
      headerElement.classList.add(sortDirection[col]);

      tableData.sort(function (a, b) {
        const valA = a[col];
        const valB = b[col];
        if (typeof valA === 'string') {
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return isAsc ? valA - valB : valB - valA;
      });

      updateTableBody(tableData, tbody, tfoot);
    }

    async function init() {
      if (callsigns.length === 0) {
        container.innerHTML = '<p class="pota-empty">No callsigns configured for POTA display.</p>';
        return;
      }

      tableData = await loadData();
      container.innerHTML = '';

      const logoUrl = (typeof window.potaBlockData !== 'undefined' && window.potaBlockData.logoUrl)
        ? window.potaBlockData.logoUrl
        : 'https://pota.app/pota-logo.png';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'pota-header';
      headerDiv.innerHTML =
        '<div class="pota-header-text">' +
          '<h2>POTA Statistics</h2>' +
          '<span class="pota-header-sub">Parks on the Air Operator Summary</span>' +
        '</div>' +
        '<div class="pota-header-logo">' +
          '<a href="https://pota.app/" target="_blank" rel="noopener noreferrer">' +
            '<img src="' + logoUrl + '" alt="POTA Logo" />' +
          '</a>' +
        '</div>';

      const wrapper = document.createElement('div');
      wrapper.className = 'pota-table-wrapper';

      const table = document.createElement('table');
      table.className = 'pota-table';
      table.innerHTML =
        '<thead>' +
          '<tr>' +
            '<th data-col="callsign">Callsign</th>' +
            '<th data-col="activations">Activations</th>' +
            '<th data-col="activatedParks">Parks Activated</th>' +
            '<th data-col="huntedParks">Hunted Parks</th>' +
            '<th data-col="qsos">Total QSOs</th>' +
            '<th data-col="awards">Awards</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody id="pota-tbody"></tbody>' +
        '<tfoot id="pota-tfoot"></tfoot>';

      wrapper.appendChild(table);
      container.appendChild(headerDiv);
      container.appendChild(wrapper);

      const tbody = table.querySelector('#pota-tbody');
      const tfoot = table.querySelector('#pota-tfoot');

      updateTableBody(tableData, tbody, tfoot);

      table.querySelectorAll('th').forEach(function (th) {
        th.addEventListener('click', function () {
          sortTable(th.getAttribute('data-col'), th, tbody, tfoot);
        });
      });
    }

    init();
  });
});