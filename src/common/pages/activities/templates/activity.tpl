<label class="item item-radio">
  <input type="radio" name="activity" value="<%= obj.id %>" <%- obj.checked ? 'checked' : ''%> />
  <div class="radio-content">
    <div class="item-content">
      <%= obj.title %>
      <% if (obj.description) { %>
        <p class="activity-description"><%= obj.description %><% if (obj.type) { %>[<%= obj.type %>]<% } %></p>
      <% } %>
    </div>
    <i class="radio-icon icon-check"></i>
  </div>
</label>
