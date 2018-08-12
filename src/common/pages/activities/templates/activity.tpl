<ion-label><%= obj.title %>
  <% if (obj.description) { %>
  <p class="activity-description"><%= obj.description %><% if (obj.type) {
    %>[<%= obj.type %>]<% } %></p>
  <% } %>
</ion-label>
<ion-radio value="<%= obj.id %>"<%- obj.checked ? 'checked' : ''%> >
</ion-radio>

