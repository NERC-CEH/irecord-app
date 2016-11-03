<h3 class="taxon"><%= obj.name %></h3>
<span class="group <%- obj.removeEditBtn ? 'right': '' %>"><%= obj.group %></span>
<% if (!obj.removeEditBtn) { %>
  <button class="btn icon icon-edit icon-small"></button>
<% } %>