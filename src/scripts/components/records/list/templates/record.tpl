<% if (obj.taxon) { %>
  <a href="#records/<%- obj.id %><%- obj.saved ? '' : '/edit' %>">
<% } else { %>
  <a href="#records/<%- obj.id %>/edit/taxon">
<% } %>

    <div class="media-object pull-left photo"><%= obj.img %></div>
    <div class="pull-right">
    <% if (obj.saved) { %>

      <div class="online-status">
        <% if (obj.isSynchronising) { %>
        <div class="icon icon-plus spin"></div>
        <% } else { %>
        <div class="icon <%- obj.onDatabase ? 'icon-upload-cloud' : 'icon-cloud' %>"></div>
        <% } %>
        <div class="icon icon-check"></div>
      </div>
      <div class="edit">
        <div id="delete" class="delete icon icon-delete"></div>
      </div>

    <% } else { %>
      <div class="edit">
        <% if (obj.taxon) { %>
        <div data-attr="date" class="js-attr icon icon-calendar"></div>
        <div data-attr="location" class="js-attr icon icon-location"></div>
        <div data-attr="number" class="js-attr icon icon-number"></div>
        <div data-attr="stage" class="js-attr icon icon-stage"></div>
        <div data-attr="comment" class="js-attr icon icon-comment"></div>
        <% } %>

        <div id="delete" class="delete icon icon-delete"></div>
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