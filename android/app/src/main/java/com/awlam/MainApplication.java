package com.awlam;

import android.app.Application;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.ReactApplication;
import cl.json.RNSharePackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.arttitude360.reactnative.rngoogleplaces.RNGooglePlacesPackage;

import io.realm.react.RealmReactPackage;

import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.merryjs.PhotoViewer.MerryPhotoViewPackage;

import com.BV.LinearGradient.LinearGradientPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.brentvatne.react.ReactVideoPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNSharePackage(),
                    new MapsPackage(),
                    new VectorIconsPackage(),
                    new RNGooglePlacesPackage(),
                    new RealmReactPackage(),
                    new MerryPhotoViewPackage(),
                    new ReactNativeOneSignalPackage(),
                    new LinearGradientPackage(),
                    new OrientationPackage(),
                    new KCKeepAwakePackage(),
                    new ReactVideoPackage(),
                    new PickerPackage(),
                    new FastImageViewPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        Fresco.initialize(this);
    }
}
