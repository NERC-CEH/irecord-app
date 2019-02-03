<% if (obj.message) { %>
<div class="info-message">
  <p><%= t(obj.message) %></p>
</div>
<% } %>
<div class="input-group">
  <textarea cols="80" rows="5" autofocus><%= obj.value %></textarea>
</div>
