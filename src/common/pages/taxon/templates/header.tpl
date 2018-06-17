<div class="pull-left">
  <a data-rel="back" class="icon icon-left-nav"></a>
</div>
<div class="pull-right" style="<%- obj.disableFilters ? 'display:none' : '' %>">
  <button id="filter-btn" class="icon icon-filter <%- obj.filterOn ? 'on': '' %>"></button>
</div>
<h1 class="title"><%= t("Species") %></h1>
