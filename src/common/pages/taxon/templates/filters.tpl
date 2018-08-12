<% obj.filters.forEach((option, i) => { %>
<ion-item>
  <ion-label class="filter-label"><%- t(obj.filters[i].label) %></ion-label>
  <ion-checkbox value="<%- obj.filters[i].id %>"
                <%- obj.selectedFilters.indexOf(parseInt(obj.filters[i].id, 10)) >= 0 ? 'checked' : '' %>
  </ion-checkbox>
</ion-item>
<% }) %>

