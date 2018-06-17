<% if (obj.message) { %>
<div class="info-message">
  <p><%= t(obj.message) %></p>
</div>
<% } %>
<div class="range">
  <input type="range" name="number" min="1" max="100" value="<%- obj.position || 1 %>">
  <input type="number" value="<%- obj.value %>">
</div>
