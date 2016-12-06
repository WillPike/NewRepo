"use strict";

/* global app, console, snap, window, SNAP_DEV_CREDENTIALS */

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

window.snap = {};

//------------------------------------------------------------------------
//
//  Application
//
//------------------------------------------------------------------------

window.snap.Application = (function () {
  function Application(App) {
    _classCallCheck(this, Application);

    if (!App) {
      throw new Error('No application provided.');
    }

    this.options = {
      environment: {
        debug: true,
        platform: 'web',
        main_application: { 'client_id': 'd67610b1c91044d8abd55cbda6c619f0', 'callback_url': 'https://api2.managesnap.com/callback/api', 'scope': '' }
      },
      hosts: {
        content: { 'host': 'api2.managesnap.com', 'secure': true }
        // socket: {
        //   'host': 'localhost',
        //   'secure': false,
        //   'port':8000,
        //   'path': '/socket/'
        // }
      }
    };

    this._application = new App(this.options, this.hosts);
  }

  _createClass(Application, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this._prepareEnvironment();

      console.log('Bootstrapping the application...');

      this._application.configure().then(function () {
        _this._application.run();
      }, function (e) {
        console.error('Unable to bootstrap the application.', e);
      });
    }
  }, {
    key: '_prepareEnvironment',
    value: function _prepareEnvironment() {
      console.log('Preparing the application environment...');

      var win = window.open;

      window.open = function (strUrl, strWindowName, strWindowFeatures) {
        var ref = win(strUrl, strWindowName, strWindowFeatures);

        if (ref) {
          new snap.PopupWatcher(ref);
        }

        return ref;
      };
    }
  }]);

  return Application;
})();

//------------------------------------------------------------------------
//
//  StartupApplication
//
//------------------------------------------------------------------------

window.snap.StartupApplication = (function (_snap$Application) {
  _inherits(StartupApplication, _snap$Application);

  function StartupApplication() {
    _classCallCheck(this, StartupApplication);

    _get(Object.getPrototypeOf(StartupApplication.prototype), 'constructor', this).call(this, app.StartupApplicationBootstraper);
  }

  return StartupApplication;
})(snap.Application);

//------------------------------------------------------------------------
//
//  ResetApplication
//
//------------------------------------------------------------------------

window.snap.ResetApplication = (function (_snap$Application2) {
  _inherits(ResetApplication, _snap$Application2);

  function ResetApplication() {
    _classCallCheck(this, ResetApplication);

    _get(Object.getPrototypeOf(ResetApplication.prototype), 'constructor', this).call(this, app.ResetApplicationBootstraper);
  }

  return ResetApplication;
})(snap.Application);

//------------------------------------------------------------------------
//
//  FlashApplication
//
//------------------------------------------------------------------------

window.snap.FlashApplication = (function (_snap$Application3) {
  _inherits(FlashApplication, _snap$Application3);

  function FlashApplication() {
    _classCallCheck(this, FlashApplication);

    _get(Object.getPrototypeOf(FlashApplication.prototype), 'constructor', this).call(this, app.FlashApplicationBootstraper);
  }

  return FlashApplication;
})(snap.Application);

//------------------------------------------------------------------------
//
//  MainApplication
//
//------------------------------------------------------------------------

window.snap.MainApplication = (function (_snap$Application4) {
  _inherits(MainApplication, _snap$Application4);

  function MainApplication() {
    _classCallCheck(this, MainApplication);

    _get(Object.getPrototypeOf(MainApplication.prototype), 'constructor', this).call(this, app.MainApplicationBootstraper);
  }

  return MainApplication;
})(snap.Application);

//------------------------------------------------------------------------
//
//  AuxiliaresApplication
//
//------------------------------------------------------------------------

window.snap.AuxiliaresApplication = (function (_snap$Application5) {
  _inherits(MainAuxApplication, _snap$Application5);

  function MainAuxApplication() {
    _classCallCheck(this, MainAuxApplication);

    _get(Object.getPrototypeOf(MainAuxApplication.prototype), 'constructor', this).call(this, app.AuxiliaresApplicationBootstraper);
  }

  return MainAuxApplication;
})(snap.Application);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlci9hcHBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7OztBQUliLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDOzs7Ozs7OztBQVFqQixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVc7QUFDVixXQURtQixXQUFXLENBQzdCLEdBQUcsRUFBRTswQkFEYSxXQUFXOztBQUV2QyxRQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1IsWUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0tBQzdDOztBQUVELFFBQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixpQkFBVyxFQUFFO0FBQ1gsYUFBSyxFQUFFLElBQUk7QUFDWCxnQkFBUSxFQUFFLEtBQUs7QUFDZix3QkFBZ0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxrQ0FBa0MsRUFBRSxjQUFjLEVBQUUsMENBQTBDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtPQUMvSTtBQUNELFdBQUssRUFBRTtBQUNMLGVBQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFOzs7Ozs7O09BTzNEO0tBQ0YsQ0FBQzs7QUFFRixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3ZEOztlQXhCNkIsV0FBVzs7V0EwQi9CLHNCQUFHOzs7QUFDWCxVQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFM0IsYUFBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOztBQUVoRCxVQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ3ZDLGNBQUssWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO09BQ3pCLEVBQUUsVUFBQSxDQUFDLEVBQUk7QUFDTixlQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQzFELENBQUMsQ0FBQztLQUNKOzs7V0FFa0IsK0JBQUc7QUFDcEIsYUFBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDOztBQUV4RCxVQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDOztBQUV0QixZQUFNLENBQUMsSUFBSSxHQUFHLFVBQVMsTUFBTSxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRTtBQUMvRCxZQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDOztBQUV4RCxZQUFJLEdBQUcsRUFBRTtBQUNQLGNBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1Qjs7QUFFRCxlQUFPLEdBQUcsQ0FBQztPQUNaLENBQUM7S0FDSDs7O1NBcEQ2QixXQUFXO0lBcUQxQyxDQUFDOzs7Ozs7OztBQVFGLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCO1lBQVMsa0JBQWtCOztBQUM1QyxXQUQwQixrQkFBa0IsR0FDekM7MEJBRHVCLGtCQUFrQjs7QUFFckQsK0JBRm1DLGtCQUFrQiw2Q0FFL0MsR0FBRyxDQUFDLDZCQUE2QixFQUFFO0dBQzFDOztTQUhvQyxrQkFBa0I7R0FBUyxJQUFJLENBQUMsV0FBVyxDQUlqRixDQUFDOzs7Ozs7OztBQVFGLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCO1lBQVMsZ0JBQWdCOztBQUN4QyxXQUR3QixnQkFBZ0IsR0FDckM7MEJBRHFCLGdCQUFnQjs7QUFFakQsK0JBRmlDLGdCQUFnQiw2Q0FFM0MsR0FBRyxDQUFDLDJCQUEyQixFQUFFO0dBQ3hDOztTQUhrQyxnQkFBZ0I7R0FBUyxJQUFJLENBQUMsV0FBVyxDQUk3RSxDQUFDOzs7Ozs7OztBQVFGLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCO1lBQVMsZ0JBQWdCOztBQUN4QyxXQUR3QixnQkFBZ0IsR0FDckM7MEJBRHFCLGdCQUFnQjs7QUFFakQsK0JBRmlDLGdCQUFnQiw2Q0FFM0MsR0FBRyxDQUFDLDJCQUEyQixFQUFFO0dBQ3hDOztTQUhrQyxnQkFBZ0I7R0FBUyxJQUFJLENBQUMsV0FBVyxDQUk3RSxDQUFDOzs7Ozs7OztBQVFGLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZTtZQUFTLGVBQWU7O0FBQ3RDLFdBRHVCLGVBQWUsR0FDbkM7MEJBRG9CLGVBQWU7O0FBRS9DLCtCQUZnQyxlQUFlLDZDQUV6QyxHQUFHLENBQUMsMEJBQTBCLEVBQUU7R0FDdkM7O1NBSGlDLGVBQWU7R0FBUyxJQUFJLENBQUMsV0FBVyxDQUkzRSxDQUFDOzs7Ozs7OztBQVFGLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCO1lBQVMsa0JBQWtCOztBQUMvQyxXQUQ2QixrQkFBa0IsR0FDNUM7MEJBRDBCLGtCQUFrQjs7QUFFeEQsK0JBRnNDLGtCQUFrQiw2Q0FFbEQsR0FBRyxDQUFDLGdDQUFnQyxFQUFFO0dBQzdDOztTQUh1QyxrQkFBa0I7R0FBUyxJQUFJLENBQUMsV0FBVyxDQUlwRixDQUFDIiwiZmlsZSI6InNlcnZlci9hcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyogZ2xvYmFsIGFwcCwgY29uc29sZSwgc25hcCwgd2luZG93LCBTTkFQX0RFVl9DUkVERU5USUFMUyAqL1xyXG5cclxud2luZG93LnNuYXAgPSB7fTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vXHJcbi8vICBBcHBsaWNhdGlvblxyXG4vL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxud2luZG93LnNuYXAuQXBwbGljYXRpb24gPSBjbGFzcyBBcHBsaWNhdGlvbiB7XHJcbiAgY29uc3RydWN0b3IoQXBwKSB7XHJcbiAgICBpZiAoIUFwcCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFwcGxpY2F0aW9uIHByb3ZpZGVkLicpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub3B0aW9ucyA9IHtcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBkZWJ1ZzogdHJ1ZSxcclxuICAgICAgICBwbGF0Zm9ybTogJ3dlYicsXHJcbiAgICAgICAgbWFpbl9hcHBsaWNhdGlvbjogeyAnY2xpZW50X2lkJzogJ2Q2NzYxMGIxYzkxMDQ0ZDhhYmQ1NWNiZGE2YzYxOWYwJywgJ2NhbGxiYWNrX3VybCc6ICdodHRwczovL2FwaTIubWFuYWdlc25hcC5jb20vY2FsbGJhY2svYXBpJywgJ3Njb3BlJzogJycgfVxyXG4gICAgICB9LFxyXG4gICAgICBob3N0czoge1xyXG4gICAgICAgIGNvbnRlbnQ6IHsgJ2hvc3QnOiAnYXBpMi5tYW5hZ2VzbmFwLmNvbScsICdzZWN1cmUnOiB0cnVlIH1cclxuICAgICAgICAvLyBzb2NrZXQ6IHtcclxuICAgICAgICAvLyAgICdob3N0JzogJ2xvY2FsaG9zdCcsXHJcbiAgICAgICAgLy8gICAnc2VjdXJlJzogZmFsc2UsXHJcbiAgICAgICAgLy8gICAncG9ydCc6ODAwMCxcclxuICAgICAgICAvLyAgICdwYXRoJzogJy9zb2NrZXQvJ1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hcHBsaWNhdGlvbiA9IG5ldyBBcHAodGhpcy5vcHRpb25zLCB0aGlzLmhvc3RzKTtcclxuICB9XHJcblxyXG4gIGluaXRpYWxpemUoKSB7XHJcbiAgICB0aGlzLl9wcmVwYXJlRW52aXJvbm1lbnQoKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZygnQm9vdHN0cmFwcGluZyB0aGUgYXBwbGljYXRpb24uLi4nKTtcclxuXHJcbiAgICB0aGlzLl9hcHBsaWNhdGlvbi5jb25maWd1cmUoKS50aGVuKCgpID0+IHtcclxuICAgICAgdGhpcy5fYXBwbGljYXRpb24ucnVuKCk7XHJcbiAgICB9LCBlID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcignVW5hYmxlIHRvIGJvb3RzdHJhcCB0aGUgYXBwbGljYXRpb24uJywgZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIF9wcmVwYXJlRW52aXJvbm1lbnQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnUHJlcGFyaW5nIHRoZSBhcHBsaWNhdGlvbiBlbnZpcm9ubWVudC4uLicpO1xyXG5cclxuICAgIHZhciB3aW4gPSB3aW5kb3cub3BlbjtcclxuXHJcbiAgICB3aW5kb3cub3BlbiA9IGZ1bmN0aW9uKHN0clVybCwgc3RyV2luZG93TmFtZSwgc3RyV2luZG93RmVhdHVyZXMpIHtcclxuICAgICAgdmFyIHJlZiA9IHdpbihzdHJVcmwsIHN0cldpbmRvd05hbWUsIHN0cldpbmRvd0ZlYXR1cmVzKTtcclxuXHJcbiAgICAgIGlmIChyZWYpIHtcclxuICAgICAgICBuZXcgc25hcC5Qb3B1cFdhdGNoZXIocmVmKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHJlZjtcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy9cclxuLy8gIFN0YXJ0dXBBcHBsaWNhdGlvblxyXG4vL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxud2luZG93LnNuYXAuU3RhcnR1cEFwcGxpY2F0aW9uID0gY2xhc3MgU3RhcnR1cEFwcGxpY2F0aW9uIGV4dGVuZHMgc25hcC5BcHBsaWNhdGlvbiB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihhcHAuU3RhcnR1cEFwcGxpY2F0aW9uQm9vdHN0cmFwZXIpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vXHJcbi8vICBSZXNldEFwcGxpY2F0aW9uXHJcbi8vXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG53aW5kb3cuc25hcC5SZXNldEFwcGxpY2F0aW9uID0gY2xhc3MgUmVzZXRBcHBsaWNhdGlvbiBleHRlbmRzIHNuYXAuQXBwbGljYXRpb24ge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoYXBwLlJlc2V0QXBwbGljYXRpb25Cb290c3RyYXBlcik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy9cclxuLy8gIEZsYXNoQXBwbGljYXRpb25cclxuLy9cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbndpbmRvdy5zbmFwLkZsYXNoQXBwbGljYXRpb24gPSBjbGFzcyBGbGFzaEFwcGxpY2F0aW9uIGV4dGVuZHMgc25hcC5BcHBsaWNhdGlvbiB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihhcHAuRmxhc2hBcHBsaWNhdGlvbkJvb3RzdHJhcGVyKTtcclxuICB9XHJcbn07XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vL1xyXG4vLyAgTWFpbkFwcGxpY2F0aW9uXHJcbi8vXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG53aW5kb3cuc25hcC5NYWluQXBwbGljYXRpb24gPSBjbGFzcyBNYWluQXBwbGljYXRpb24gZXh0ZW5kcyBzbmFwLkFwcGxpY2F0aW9uIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKGFwcC5NYWluQXBwbGljYXRpb25Cb290c3RyYXBlcik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy9cclxuLy8gIEF1eGlsaWFyZXNBcHBsaWNhdGlvblxyXG4vL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxud2luZG93LnNuYXAuQXV4aWxpYXJlc0FwcGxpY2F0aW9uID0gY2xhc3MgTWFpbkF1eEFwcGxpY2F0aW9uIGV4dGVuZHMgc25hcC5BcHBsaWNhdGlvbiB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihhcHAuQXV4aWxpYXJlc0FwcGxpY2F0aW9uQm9vdHN0cmFwZXIpO1xyXG4gIH1cclxufTtcclxuIl19
