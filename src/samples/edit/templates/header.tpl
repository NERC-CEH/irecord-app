<div class="pull-left">
  <a data-rel="back" class="icon icon-left-nav"></a>
</div>
<div class="pull-right">
  <button  id="sample-save-btn"
           class="icon <%- obj.isSynchronising ? 'icon-plus icon-spin disabled' : 'icon-send' %>"></button>
</div>
<h1 class="title"><%= t("Edit") %></h1>


<%  if(obj.activity_title || obj.training) { %>
<div id="subheader">
  <% if (obj.activity_title) { %>
  <div class="activity"></div>
  <% } %>
  <% if (obj.training) { %>
  <div class="training"></div>
  <% } %>
</div>
<% } %>
