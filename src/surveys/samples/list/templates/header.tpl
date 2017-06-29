<div class="pull-left">
  <a data-rel="back" class="icon icon-left-nav"></a>
</div>
<div class="pull-right">
  <div class="img-picker icon icon-camera">
    <input type="file" accept="image/*"/>
  </div>
  <button id="create-new-btn" class="icon icon-plus"></button>
</div>

<div id="subheader">
  <div class="surveys"></div>
  <% if (obj.training) { %>
  <div class="training"></div>
  <% } %>
</div>