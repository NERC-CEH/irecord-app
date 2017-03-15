<% if (obj.message) { %>
<div class="info-message">
  <p><%= obj.message %></p>
</div>
<% } %>

<ul class="list">
<% obj.selection.forEach((option) => { %>
  <li class="item item-checkbox item-small">
    <label class="checkbox">
      <input type="checkbox" value="<%= option %>" <%- obj.selected.indexOf(option) >= 0 ? 'checked' : ''%>>
    </label>
    <%= option %>
  </li>
<% }) %>
</ul>