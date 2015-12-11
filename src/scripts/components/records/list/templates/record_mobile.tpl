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
      <p class="species"> <%= obj.taxon %></p>
      <% } else { %>
      <p class="species"><i class="warn">Required: species</i></p>
      <% } %>

      <% if (obj.date) { %>
      <p class="date"><%= obj.date %></p>
      <% } else { %>
      <p><i class="date warn">Required: date</i></p>
      <% } %>

      <p class="number"><%= obj.number %></p>
      <p class="stage"><%= obj.stage %></p>

      <p class="comment"><%= obj.comment %></p>

    </div>
  </a>

  <div class="mobile-edit">
    <div id="delete" class="delete icon icon-delete"></div>
  </div>