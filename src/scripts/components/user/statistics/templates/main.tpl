<ul class="table-view">
  <li class="table-view-divider">Top species</li>
  <% obj.species.forEach(function(specie) { %>
    <li class="table-view-cell"><span class="stat"><%- specie.count %></span><%- specie.common_name || specie.taxon %></li>
  <% }); %>
</ul>
