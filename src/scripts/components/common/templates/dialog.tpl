<% if (obj.title) { %>
<div class="dialog-header">
  <h3><%= obj.title %></h3>
</div>
<% } %>

<% if (obj.body) { %>
<div class="dialog-body">
  <div><%= obj.body %></div>
</div>
<% } %>

<% if (obj.buttons) { %>
<div class="dialog-buttons">
  <% _.each (obj.buttons, function (button) { %>
    <button id="<%- button.id %>" class="btn <%- button.class %>" ><%- button.title %></button>
  <% }) %>
</div>
<% } %>
