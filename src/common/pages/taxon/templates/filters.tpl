<ul class="list">

  <% for (var i = 0; i < obj.filters.length; i++) { %>
    <li class="item item-checkbox item-small">
      <label class="checkbox">
        <input type="checkbox" value="<%- obj.filters[i].id %>"
        <%- obj.selectedFilters.indexOf(parseInt(obj.filters[i].id, 10)) >= 0 ? 'checked' : '' %> >
      </label>
      <span class="filter-label"><%- t(obj.filters[i].label) %></span>
    </li>
  <% } %>

</ul>
