<div class="location">
  <%= (obj.name ? '<strong>' + obj.name + '</strong>' : '') %>
  <p> <%- obj.location %></p>
</div>

<div class="mobile-swipe-edit">
  <div id="delete" class="delete icon icon-delete <%- obj.name ? 'with-name' : '' %>"></div>
</div>