<% if (obj.taxon) { %>
<a href="#records/<%- obj.id %><%- obj.saved ? '' : '/edit' %>">
  <% } else { %>
  <a href="#records/<%- obj.id %>/edit/taxon">
    <% } %>
    <div class="media-object pull-left photo"><%= obj.img %></div>
    <div class="pull-right">
      <% if (obj.saved) { %>
      <div class="online-status icon <%- obj.onDatabase ? 'icon-upload-cloud' : 'icon-cloud' %>"></div>
      <div class="online-status icon icon-check"></div>
      <% } %>
    </div>

    <div class="media-body">
      <% if (obj.taxon) { %>
      <strong> <%= obj.taxon %></strong>
      <% } else { %>
      <strong><i class="warn">Required: species</i></strong>
      <% } %>

      <% if (obj.date) { %>
      <p><%= obj.date %></p>
      <% } else { %>
      <p><i class="warn">Required: date</i></p>
      <% } %>

      <p class="number"><%= obj.number %></p>
      <p class="stage"><%= obj.stage %></p>
      <p class="comment"><%= obj.comment %></p>

    </div>
  </a>