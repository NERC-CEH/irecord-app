<h3 class="taxon"><%= name %></h3>
<span class="group <%- obj.removeEditBtn ? 'right': '' %>"><%= group %></span>
<% if (!obj.removeEditBtn) { %>
  <button class="btn icon icon-edit icon-small"></button>
<% } %>