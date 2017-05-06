<% if (obj.message) { %>
<div class="info-message">
  <p><%= obj.message %></p>
</div>
<% } %>
<div class="input-group">
  <input type="text" class="<%= obj.typeahead ? 'typeahead' : '' %>" pattern="<%= obj.pattern ? obj.pattern : '' %>" value="<%= obj.value %>"/>
</div>