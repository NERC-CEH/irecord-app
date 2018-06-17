<% if (obj.message) { %>
<div class="info-message">
  <p><%= t(obj.message) %></p>
</div>
<% } %>
<div class="input-group">
  <input type="<%- obj.type %>" class="<%= obj.typeahead ? 'typeahead' : '' %>" max="<%- obj.max %>" value="<%= obj.value %>"/>
</div>
