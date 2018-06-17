<div id="left-panel" class="pull-left">
  <a data-rel="back" class="icon icon-left-nav"></a>
</div>

<div id="right-panel" class="pull-right"></div>

<h1 class="title <%- obj.subtitle ? 'with-subtitle' : '' %>"><%- t(obj.title) %></h1>
<%  if(obj.subtitle) { %>
  <h3 class="subtitle"><%- t(obj.subtitle) %></h3>
<% } %>

<%  if(obj.subheader) { %>
<div id="subheader"><%- t(obj.subheader) %></div>
<% } %>
