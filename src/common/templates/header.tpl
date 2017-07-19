<div id="left-panel" class="pull-left">
  <a data-rel="back" class="icon icon-left-nav"></a>
</div>

<div id="right-panel" class="pull-right"></div>

<h1 class="title <%- obj.subtitle ? 'with-subtitle' : '' %>"><%- obj.title %></h1>
<%  if(obj.subtitle) { %>
  <h3 class="subtitle"><%- obj.subtitle %></h3>
<% } %>

<%  if(obj.subheader) { %>
<div id="subheader"><%- obj.subheader %></div>
<% } %>