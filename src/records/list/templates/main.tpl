<% if (obj.activity) { %>
<div class="list-header activity"><%- obj.activity %></div>
<% } %>

<% if (obj.useTraining) { %>
<div class="list-header training">training mode</div>
<% } %>

<ul id="records-list" class="table-view no-top"></ul>
