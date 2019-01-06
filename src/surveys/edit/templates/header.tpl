<div class="pull-left">
  <a data-rel="back" class="icon icon-left-nav"></a>
</div>
<div class="pull-right">
    <button id="sample-save-btn">Send <span class="icon <%- obj.isSynchronising ? 'icon-plus icon-spin disabled' : 'icon-send' %>"></span></button>
</div>
<h1 class="title">Plant List</h1>

<div id="subheader">
  <div class="surveys"></div>
  <% if (obj.training) { %>
  <div class="training"></div>
  <% } %>
</div>
