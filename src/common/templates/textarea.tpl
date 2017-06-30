<% if (obj.message) { %>
<div class="info-message">
  <p><%= obj.message %></p>
</div>
<% } %>
<div class="input-group">
  <textarea cols="80" rows="16" autofocus><%= obj.value %></textarea>
</div>
