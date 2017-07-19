<% if (obj.message) { %>
<div class="info-message">
  <p><%= obj.message %></p>
</div>
<% } %>
<div id="main-input" class="input-group">
  <button class="add-new icon icon-plus"></button>
  <% for (var i = obj.value.length; i >= 0; i--) { %>
  <input type="text" value="<%= obj.value[i] %>"/>
  <% } %>
</div>
