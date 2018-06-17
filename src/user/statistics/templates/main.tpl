<ul class="table-view">
  <li class="table-view-divider"><%= t("Top species") %></li>
  <% obj.species.forEach(function(specie) { %>
    <li class="table-view-cell"><span class="stat"><%- specie.count %></span><%- specie.common || specie.taxon %></li>
  <% }); %>
</ul>
