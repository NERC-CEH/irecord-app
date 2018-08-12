<% if (obj.message) { %>
<div class="info-message">
  <p><%= t(obj.message) %></p>
</div>
<% } %>

<ion-list lines="full">
  <ion-radio-group>

    <% obj.selection.forEach((option) => { %>
    <ion-item>
      <ion-label><%= t(option.label || option.value) %></ion-label>
      <ion-radio value="<%= option.value %>"
      <%- option.value === obj.selected ? 'checked' : ''%>></ion-radio>
    </ion-item>
    <% }) %>

  </ion-radio-group>
</ion-list>
