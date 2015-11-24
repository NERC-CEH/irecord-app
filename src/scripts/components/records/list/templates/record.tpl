<% if (obj.taxon) { %>
  <a href="#records/<%- obj.id %>/edit" class="navigate-right">
<% } else { %>
  <a href="#records/<%- obj.id %>/edit/taxon" class="navigate-right">
<% } %>
    <div class="media-object pull-left photo"><%= obj.img %></div>
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
    </div>
</a>