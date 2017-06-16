<ul class="list" style="overflow: hidden;">

  <% for (filterID in obj.informalGroups) { %>
    <li class="item item-checkbox item-small">
      <label class="checkbox">
        <input type="checkbox" value="<%- filterID %>"
        <%- obj.selectedFilters.indexOf(parseInt(filterID, 10)) >= 0 ? 'checked' : '' %> >
      </label>
      <span class="filter-label"><%- obj.informalGroups[filterID] %></span>
    </li>
  <% } %>

</ul>
