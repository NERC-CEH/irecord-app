<% if (obj.message) { %>
<div class="info-message">
  <p><%= obj.message %></p>
</div>
<% } %>
<div class="input-group">
  <textarea id="record-comment" cols="80" rows="16" autofocus><%= obj.value %></textarea>
</div>
