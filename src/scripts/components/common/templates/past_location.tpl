<div id="location" class="location">
  <%= (obj.name ? '<strong>' + obj.name + '</strong>' : '') %>
  <p> <%- obj.location %></p>
  <span class="location-source">source: <%- obj.source %></span>
</div>

<div class="mobile-swipe-edit">
  <div id="edit" class="edit icon icon-edit <%- obj.name ? 'with-name' : '' %>"></div>
  <div id="delete" class="delete icon icon-delete <%- obj.name ? 'with-name' : '' %>"></div>
</div>