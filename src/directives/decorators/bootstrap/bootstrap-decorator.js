angular.module('schemaForm').config(['schemaFormDecoratorsProvider',function(decoratorsProvider){
  var base = 'directives/decorators/bootstrap/';

  decoratorsProvider.createDecorator('bootstrapDecorator',{
    textarea: base+'textarea.html',
    fieldset: base+'fieldset.html',
    list: base+'list.html',
    tabs: base+'tabs.html',
    section: base+'section.html',
    conditional: base+'section.html',
    actions: base+'actions.html',
    select: base+'select.html',
    checkbox: base+'checkbox.html',
    checkboxes: base+'checkboxes.html',
    number: base+'default.html',
    password: base+'default.html',
    submit: base+'submit.html',
    button: base+'submit.html',
    radios: base+'radios.html',
    radiobuttons: base+'radio-buttons.html',
    help: base+'help.html',
    'default': base+'default.html'
  },[
    function(form){
      if (form.readonly && form.key && form.type !== 'fieldset') {
        return base+'readonly.html';
      }
    }
  ]);

  //manual use directives
  decoratorsProvider.createDirectives({
    textarea: base+'textarea.html',
    select: base+'select.html',
    checkbox: base+'checkbox.html',
    checkboxes: base+'checkboxes.html',
    number: base+'default.html',
    submit: base+'submit.html',
    button: base+'submit.html',
    text: base+'default.html',
    date: base+'default.html',
    password: base+'default.html',
    datepicker: base+'datepicker.html',
    input: base+'default.html',
    radios: base+'radios.html',
    radiobuttons: base+'radio-buttons.html',
  });

}]).directive('sfFieldset',function(){
  return {
    transclude: true,
    scope: true,
    templateUrl: 'directives/decorators/bootstrap/fieldset-trcl.html',
    link: function(scope,element,attrs) {
      scope.title = scope.$eval(attrs.title);
    }
  };
}).directive('sfList',function(){
  return {
    templateUrl: 'directives/decorators/bootstrap/list-body.html',

    link: function(scope,element,attrs) {
      var key = scope.form.items.key;
      var value = getNested(scope.model, key) || [];
      setNested(scope.model, key, value);

      scope.value = value;
      scope.renderedValue = angular.copy(scope.value);

      var storedValue = null;
      scope.$on('change', function(evt, val){
        var index = findElement(element[0], val.element[0]);

        if (index == -1){
          // The add input
          storedValue = val.value;
        } else {
          scope.value[index] = val.value;
          setNested(scope.model, key, scope.value);
        }
      });

      scope.$on('remove', function(evt, val){
        var index = findElement(element[0], val.element[0]);

        scope.renderedValue.splice(index, 1);

        scope.value.splice(index, 1);
        setNested(scope.model, key, scope.value);
        val.element[0].parentNode.removeChild(val.element[0]);
      });

      scope.add = function(){ 
        scope.renderedValue.push(storedValue);

        scope.value.push(storedValue);
        setNested(scope.model, key, scope.value);

        scope.$broadcast('add');
      };
    }
  }
}).directive('sfListItem',function(){
  return {
    scope: {
      'form': '=',
      'value': '=',
      'newEntry': '@'
    },

    templateUrl: 'directives/decorators/bootstrap/list-item.html',

    link: function(scope,element,attrs) {
      var initialValue = angular.copy(scope.value);

      scope.form.items.key = 'value';
      scope.model = {
        value: scope.value
      };

      scope.$watch('model', function(val){
        scope.$emit('change', {
          value: val.value,
          element: element
        });
      }, true);


      scope.$on('add', function(){
        if (scope.newEntry){
          scope.model.value = initialValue;
        }
      });

      scope.remove = function() {
        scope.$emit('remove', {
          element: element
        });
      };
    }
  }
});

function findElement(parentEl, element){
  var els = parentEl.querySelectorAll('[sf-list-item]');
  for (var i=0; i < els.length; i++){
    if (els[i].isEqualNode(element)){
      if (els[i].tagName === 'DIV'){
        return -1;
      } else {
        return i;
      }
    }
  }
}

function setNested(obj, key, value){
  var bits = key.split('.');
  for (var i=0; i < bits.length - 1; i++){
    if (!obj[bits[i]])
      obj[bits[i]] = {};

    obj = obj[bits[i]];
  }

  obj[bits[bits.length - 1]] = value;
}

function getNested(obj, key){
  var bits = key.split('.');
  for (var i=0; i < bits.length; i++){
    obj = obj[bits[i]];

    if (!obj){
      return undefined;
    }
  }
  return obj;
}
