<% if (obj.message) { %>
<div class="info-message">
  <p><%= obj.message %></p>
</div>
<% } %>
<div id="main-input" class="input-group">
  <button class="add-new icon icon-plus"></button>
  <% for (var i = 0; i <= obj.value.length; i++) { %>
  <input type="text" value="<%= obj.value[obj.value.length - i] %>"/>
  <% } %>
</div>
