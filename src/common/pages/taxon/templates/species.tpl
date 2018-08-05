<h3 class="taxon"><%= obj.name %></h3>
<span class="group <%- !obj.showEditButton ? 'right': '' %>"><%= t(obj.group) %></span>
<% if (obj.showEditButton) { %>
  <button class="edit-shortcut icon icon-edit icon-small"></button>
<% } %>
