<div id="location" class="location">
  <%= (obj.name ? '<strong>' + obj.name + '</strong>' : '') %>
  <p> <%- obj.location %></p>
  <span class="location-favourite icon icon-star <%- obj.favourite ? 'on' : '' %>"></span>
  <span class="location-date"><%- obj.date %></span>
  <span class="location-source"><%= t("source") %>: <%- t(obj.source) %></span>
</div>

<div class="mobile-swipe-edit">
  <div id="edit" class="edit icon icon-edit <%- obj.name ? 'with-name' : '' %>"></div>
  <div id="delete" class="delete icon icon-delete <%- obj.name ? 'with-name' : '' %>"></div>
</div>
