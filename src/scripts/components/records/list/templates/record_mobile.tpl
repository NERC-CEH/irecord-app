<% if (obj.taxon) { %>
<a href="#records/<%- obj.id %><%- obj.saved ? '' : '/edit' %>" class="mobile">
  <% } else { %>
  <a href="#records/<%- obj.id %>/edit/taxon" class="mobile">
    <% } %>
    <div class="media-object pull-left photo"><%= obj.img %></div>
    <div class="pull-right">
      <% if (obj.saved) { %>
      <div class="online-status">
        <div class="icon <%- obj.onDatabase ? 'icon-upload-cloud' : 'icon-cloud' %>"></div>
        <div class="icon icon-check"></div>
      </div>
      <% } %>
    </div>

    <div class="media-body">
      <% if (obj.taxon) { %>
      <div class="species"> <%= obj.taxon %></div>
      <% } else { %>
      <div class="species warn">Species missing</div>
      <% } %>

      <% if (obj.date) { %>
      <div class="date"><%= obj.date %></div>
      <% } else { %>
      <div class="date warn">Date</div>
      <% } %>

      <% if (obj.location) { %>
      <div class="location"><%= obj.location %></div>
      <% } else { %>
      <div class="location warn">Location</div>
      <% } %>

      <div class="attributes">
        <div class="number"><%= obj.number %></div>
        <div class="stage"><%= obj.stage %></div>
        <div class="comment"><%= obj.comment %></div>
      </div>
    </div>
  </a>

  <div class="mobile-edit">
    <div id="delete" class="delete icon icon-delete"></div>
  </div>