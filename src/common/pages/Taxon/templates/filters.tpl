<ion-label><%- t('Names:') %></ion-label>
<ion-radio-group value="<%- obj.searchNamesOnly %>">
  <ion-item>
    <ion-label><%- t('Default') %></ion-label>
    <ion-radio value="" />
  </ion-item>
  <ion-item>
    <ion-label><%- t('Common only') %></ion-label>
    <ion-radio value="common" />
  </ion-item>
  <ion-item>
    <ion-label><%- t('Scientific only') %></ion-label>
    <ion-radio value="scientific" />
  </ion-item>
</ion-radio-group>

<div class="taxon-groups">
  <ion-label><%- t('Taxon groups:') %></ion-label>
  <% obj.filters.forEach(function (option, i) { %>
  <ion-item>
    <ion-label class="filter-label"><%- t(obj.filters[i].label) %></ion-label>
    <ion-checkbox value="<%- obj.filters[i].id %>"
                  <%- obj.selectedFilters.indexOf(parseInt(obj.filters[i].id, 10)) >= 0 ? 'checked' : '' %>
    </ion-checkbox>
  </ion-item>
  <% }) %>
</div>
