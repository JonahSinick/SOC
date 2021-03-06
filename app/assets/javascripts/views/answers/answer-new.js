SOC.Views.NewAnswer = Backbone.CompositeView.extend({
  template: JST['answers/new'],
  
  
  

  events: {
    'click .question-answer': 'submit'
  },

  initialize: function(options){
    this.question = options.question;
    this.superView = options.superView;
    this.errors = [];
  },

  render: function () {
    var content = this.template({
      answer: this.model,
      question: this.question,
      errors: this.errors
    });
    this.$el.html(content);
    
    return this;
  },


  submit: function (event) {
    SOC.requireSignedIn()
    var that = this;
    event.preventDefault();
    
    var params = { 
      answer: {
        body: $('#answer-body').val(),
        question_id: this.question.id
      }
    };
    
    if(this.model.id===undefined){
      this.model.save(params, {
        success: function(model, response){
          Backbone.history.navigate("questions/" + that.question.id, {trigger:true})
          that.collection.add(model)
          that.superView.render();
        },
        error: function (model, response, opts) {
          that.errors = response.responseJSON;
          that.render();
        }
      });      
    } else{
      this.model.save(params, {
        success: function(model, response){
          Backbone.history.navigate("questions/" + that.question.id, {trigger:true})
          that.superView.render();
        },
        error: function (model, response, opts) {
          that.errors = response.responseJSON;
          that.render();
        }
      });      
    }
  }
});